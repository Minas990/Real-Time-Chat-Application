resource "aws_s3_bucket" "media" {
  bucket = "${var.project_name}-media-${var.bucket_suffix}"

  tags = {
    Name = "${var.project_name}-media"
  }
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id

  versioning_configuration {
    status = "Disabled"
  }
}

#Two logical prefixes inside the shared bucket:
#   profile-photos/  -> written by user-service
#   message-media/   -> written by chat-service
#These are conventions enforced via IAM policy conditions in the compute
#modules, not physical sub-resources.
