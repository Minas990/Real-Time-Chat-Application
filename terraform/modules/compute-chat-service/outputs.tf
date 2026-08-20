output "asg_name" {
  value = aws_autoscaling_group.chat_service.name
}

output "iam_role_arn" {
  value = aws_iam_role.chat_service.arn
}
