resource "aws_iam_role" "user_service" {
  name = "${var.project_name}-user-service-role"

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

resource "aws_iam_instance_profile" "user_service" {
  name = "${var.project_name}-user-service-profile"
  role = aws_iam_role.user_service.name
}

resource "aws_iam_role_policy" "user_service_dynamodb" {
  name = "${var.project_name}-user-service-dynamodb"
  role = aws_iam_role.user_service.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query"
        ]
        Resource = var.users_table_arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "user_service_s3" {
  name = "${var.project_name}-user-service-s3"
  role = aws_iam_role.user_service.id

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
        Resource = "${var.media_bucket_arn}/profile-photos/*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "user_service_sns" {
  name = "${var.project_name}-user-service-sns"
  role = aws_iam_role.user_service.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "sns:Publish"
        Resource = var.sns_topic_arn
      }
    ]
  })
}
