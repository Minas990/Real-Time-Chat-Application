variable "project_name" {
  type = string
}

variable "bucket_suffix" {
  description = "Unique suffix to avoid global S3 bucket name collisions"
  type        = string
}
