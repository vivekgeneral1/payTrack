package com.paytrack.invoice;

import com.paytrack.common.dto.PageResponse;
import com.paytrack.invoice.dto.InvoiceDto;
import com.paytrack.invoice.dto.InvoiceUploadMetadata;
import com.paytrack.security.CurrentUserId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public PageResponse<InvoiceDto> search(@CurrentUserId UUID userId,
                                            @RequestParam(required = false) UUID paymentId,
                                            @RequestParam(required = false) UUID subscriptionId,
                                            @RequestParam(required = false) String search,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return invoiceService.search(userId, paymentId, subscriptionId, search, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public InvoiceDto getOne(@CurrentUserId UUID userId, @PathVariable UUID id) {
        return invoiceService.getOne(userId, id);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<InvoiceDto> upload(@CurrentUserId UUID userId,
                                              @RequestPart("file") MultipartFile file,
                                              @RequestParam(required = false) UUID paymentId,
                                              @RequestParam(required = false) UUID subscriptionId,
                                              @RequestParam(required = false) String invoiceNumber,
                                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate invoiceDate,
                                              @RequestParam(required = false) BigDecimal amount,
                                              @RequestParam(required = false) String vendorName) {
        InvoiceUploadMetadata metadata = new InvoiceUploadMetadata(paymentId, subscriptionId, invoiceNumber, invoiceDate, amount, vendorName);
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.upload(userId, file, metadata));
    }

    // Returns the presigned URL as JSON rather than a 302 redirect: a JS-initiated fetch that follows
    // a cross-origin redirect runs into inconsistent Authorization-header-stripping behavior across
    // browsers, which made the object store reject the request. The frontend fetches this URL itself,
    // with no auth header, as a second, unauthenticated step.
    @GetMapping("/{id}/download")
    public Map<String, String> download(@CurrentUserId UUID userId, @PathVariable UUID id) {
        return Map.of("url", invoiceService.downloadUrl(userId, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@CurrentUserId UUID userId, @PathVariable UUID id) {
        invoiceService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
