resource "aws_dynamodb_table" "notifications_idempotency" {
  name         = "${var.project_name}-notifications-idempotency"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "eventKey"

  attribute {
    name = "eventKey"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Name = "${var.project_name}-notifications-idempotency"
  }
}
