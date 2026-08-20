output "sns_topic_arn" {
  value = aws_sns_topic.user_events.arn
}

output "email_queue_arn" {
  value = aws_sqs_queue.email.arn
}

output "email_queue_url" {
  value = aws_sqs_queue.email.id
}

output "message_deletion_queue_arn" {
  value = aws_sqs_queue.message_deletion.arn
}

output "message_deletion_queue_url" {
  value = aws_sqs_queue.message_deletion.id
}
