output "users_table_name" {
  value = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  value = aws_dynamodb_table.users.arn
}

output "notifications_idempotency_table_name" {
  value = aws_dynamodb_table.notifications_idempotency.name
}

output "notifications_idempotency_table_arn" {
  value = aws_dynamodb_table.notifications_idempotency.arn
}
