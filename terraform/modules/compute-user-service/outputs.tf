output "asg_name" {
  value = aws_autoscaling_group.user_service.name
}

output "iam_role_arn" {
  value = aws_iam_role.user_service.arn
}
