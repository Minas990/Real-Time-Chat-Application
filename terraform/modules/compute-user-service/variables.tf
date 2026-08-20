variable "project_name" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "user_service_sg_id" {
  type = string
}

variable "target_group_arn" {
  type = string
}

variable "users_table_arn" {
  type = string
}

variable "media_bucket_arn" {
  type = string
}

variable "sns_topic_arn" {
  type = string
}
