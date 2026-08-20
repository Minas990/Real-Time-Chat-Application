output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "vpc_id" {
  value = module.network.vpc_id
}

output "media_bucket_name" {
  value = module.data_s3.bucket_id
}

output "redis_endpoint" {
  value = module.data_redis.redis_endpoint
}

output "rds_endpoint" {
  value       = module.data_rds.db_endpoint
  sensitive   = true
}

output "sns_topic_arn" {
  value = module.messaging.sns_topic_arn
}

output "notifications_lambda_name" {
  value = module.lambda_notifications.function_name
}

output "message_deletion_lambda_name" {
  value = module.lambda_message_deletion.function_name
}
