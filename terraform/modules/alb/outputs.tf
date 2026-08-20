output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "user_service_tg_arn" {
  value = aws_lb_target_group.user_service.arn
}

output "chat_service_tg_arn" {
  value = aws_lb_target_group.chat_service.arn
}
