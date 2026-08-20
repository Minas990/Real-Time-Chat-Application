resource "aws_iam_role" "chat_service" {
  name = "${var.project_name}-chat-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "chat_service" {
  name = "${var.project_name}-chat-service-profile"
  role = aws_iam_role.chat_service.name
}

#RDS and Redis access are governed by security groups + DB credentials,
#not IAM - no policy needed for those here.
resource "aws_iam_role_policy" "chat_service_s3" {
  name = "${var.project_name}-chat-service-s3"
  role = aws_iam_role.chat_service.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${var.media_bucket_arn}/message-media/*"
      }
    ]
  })
}
