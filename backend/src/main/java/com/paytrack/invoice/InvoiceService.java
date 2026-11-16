package com.paytrack.invoice;

import com.paytrack.common.dto.PageResponse;
import com.paytrack.common.exception.BadRequestException;
import com.paytrack.common.exception.ResourceNotFoundException;
import com.paytrack.integration.storage.InvoiceStorageService;
import com.paytrack.invoice.dto.InvoiceDto;
import com.paytrack.invoice.dto.InvoiceUploadMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024;

    private final InvoiceRepository invoiceRepository;
    private final InvoiceStorageService storageService;

    public PageResponse<InvoiceDto> search(UUID userId, UUID paymentId, UUID subscriptionId, String search, Pageable pageable) {
        String effectiveSearch = search == null ? "" : search;
        Page<Invoice> page = invoiceRepository.search(userId, paymentId, subscriptionId, effectiveSearch, pageable);
        return PageResponse.from(page.map(this::toDto));
    }

    public InvoiceDto getOne(UUID userId, UUID id) {
        return toDto(findOwned(userId, id));
    }

    @Transactional
    public InvoiceDto upload(UUID userId, MultipartFile file, InvoiceUploadMetadata metadata) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was provided");
        }
        if (!"application/pdf".equals(file.getContentType())) {
            throw new BadRequestException("Only PDF invoices are supported");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException("File exceeds the 10MB limit");
        }

        String entityType = metadata.subscriptionId() != null ? "SUBSCRIPTION" : "PAYMENT";
        UUID entityId = metadata.subscriptionId() != null ? metadata.subscriptionId() : metadata.paymentId();
        String objectKey = storageService.buildObjectKey(userId, entityId != null ? entityType : "GENERAL",
                entityId != null ? entityId : userId, file.getOriginalFilename());
        storageService.upload(objectKey, file);

        Invoice invoice = Invoice.builder()
                .userId(userId)
                .paymentId(metadata.paymentId())
                .subscriptionId(metadata.subscriptionId())
                .fileObjectKey(objectKey)
                .originalFilename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .sizeBytes(file.getSize())
                .invoiceNumber(metadata.invoiceNumber())
                .invoiceDate(metadata.invoiceDate())
                .amount(metadata.amount())
                .vendorName(metadata.vendorName())
                .build();
        // saveAndFlush (not save) so the @CreationTimestamp-generated uploadedAt is populated
        // back onto the entity before toDto() reads it, instead of only appearing at commit time.
        return toDto(invoiceRepository.saveAndFlush(invoice));
    }

    public String downloadUrl(UUID userId, UUID id) {
        Invoice invoice = findOwned(userId, id);
        return storageService.presignedDownloadUrl(invoice.getFileObjectKey());
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Invoice invoice = findOwned(userId, id);
        storageService.delete(invoice.getFileObjectKey());
        invoiceRepository.delete(invoice);
    }

    private Invoice findOwned(UUID userId, UUID id) {
        return invoiceRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    private InvoiceDto toDto(Invoice i) {
        return new InvoiceDto(i.getId(), i.getPaymentId(), i.getSubscriptionId(), i.getOriginalFilename(),
                i.getContentType(), i.getSizeBytes(), i.getInvoiceNumber(), i.getInvoiceDate(), i.getAmount(),
                i.getVendorName(), i.getUploadedAt());
    }
}
