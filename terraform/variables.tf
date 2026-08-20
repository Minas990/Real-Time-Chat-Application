variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used to prefix/tag all resources"
  type        = string
  default     = "friendchat"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets, one per AZ"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets, one per AZ"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "db_name" {
  description = "Postgres database name for chat-service"
  type        = string
  default     = "chatdb"
}

variable "db_username" {
  description = "Master username for RDS Postgres"
  type        = string
  default     = "chatapp_admin"
}

variable "db_password" {
  description = "Master password for RDS Postgres"
  type        = string
  sensitive   = true
}

variable "brevo_api_key" {
  description = "Brevo (Sendinblue) API key, stored in SSM Parameter Store as SecureString"
  type        = string
  sensitive   = true
}

variable "brevo_sender_email" {
  description = "Verified sender email address in Brevo"
  type        = string
}

variable "user_service_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "chat_service_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "redis_node_type" {
  type    = string
  default = "cache.t3.micro"
}

variable "rds_instance_class" {
  type    = string
  default = "db.t3.micro"
}
