resource "aws_ssm_parameter" "brevo_api_key" {
  name        = "/${var.project_name}/notifications/brevo-api-key"
  description = "Brevo (Sendinblue) transactional email API key"
  type        = "SecureString"
  value       = var.brevo_api_key

  tags = {
    Name = "${var.project_name}-brevo-api-key"
  }
}
