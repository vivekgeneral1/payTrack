package com.paytrack.integration.storage;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceStorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${paytrack.minio.bucket}")
    private String bucket;

    @Value("${paytrack.cors.allowed-origins}")
    private String allowedOrigins;

    @PostConstruct
    public void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception ex) {
            try {
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
                log.info("Created MinIO bucket '{}'", bucket);
            } catch (Exception creationEx) {
                log.warn("Could not verify/create MinIO bucket '{}': {}", bucket, creationEx.getMessage());
            }
        }
        // Invoice downloads are served via presigned GET URLs the browser fetches directly from the
        // object store, so the bucket itself needs CORS allowing the frontend origin - the backend's
        // own CORS config (SecurityConfig) only covers /api/** requests, not S3 object requests.
        try {
            s3Client.putBucketCors(PutBucketCorsRequest.builder()
                    .bucket(bucket)
                    .corsConfiguration(CORSConfiguration.builder()
                            .corsRules(CORSRule.builder()
                                    .allowedMethods("GET")
                                    .allowedOrigins(List.of(allowedOrigins.split(",")))
                                    .allowedHeaders("*")
                                    .build())
                            .build())
                    .build());
        } catch (Exception corsEx) {
            log.warn("Could not configure CORS on bucket '{}': {}", bucket, corsEx.getMessage());
        }
    }

    public String buildObjectKey(UUID userId, String entityType, UUID entityId, String originalFilename) {
        String safeName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        return "%s/%s/%s/%s-%s".formatted(userId, entityType, entityId, UUID.randomUUID(), safeName);
    }

    public void upload(String objectKey, MultipartFile file) {
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(objectKey)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload invoice to storage", e);
        }
    }

    public String presignedDownloadUrl(String objectKey) {
        GetObjectRequest getRequest = GetObjectRequest.builder().bucket(bucket).key(objectKey).build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .getObjectRequest(getRequest)
                .build();
        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    public void delete(String objectKey) {
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(objectKey).build());
    }
}
