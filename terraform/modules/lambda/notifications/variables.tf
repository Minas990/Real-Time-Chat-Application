variable "project_name" {
  type = string
}

variable "email_queue_arn" {
  type = string
}

variable "idempotency_table_name" {
  type = string
}

variable "idempotency_table_arn" {
  type = string
}

variable "brevo_api_key" {
  type      = string
  sensitive = true
}

variable "brevo_sender_email" {
  type = string
}
