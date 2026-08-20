output "alb_sg_id" {
  value = aws_security_group.alb.id
}

output "user_service_sg_id" {
  value = aws_security_group.user_service.id
}

output "chat_service_sg_id" {
  value = aws_security_group.chat_service.id
}

output "redis_sg_id" {
  value = aws_security_group.redis.id
}

output "rds_sg_id" {
  value = aws_security_group.rds.id
}

output "lambda_message_deletion_sg_id" {
  value = aws_security_group.lambda_message_deletion.id
}
