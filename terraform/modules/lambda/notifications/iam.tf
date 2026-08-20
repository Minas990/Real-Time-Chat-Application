resource "aws_iam_role" "notifications" {
  name = "${var.project_name}-notifications-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "notifications_basic_execution" {
  role       = aws_iam_role.notifications.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "notifications_sqs" {
  name = "${var.project_name}-notifications-sqs"
  role = aws_iam_role.notifications.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = var.email_queue_arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "notifications_dynamodb" {
  name = "${var.project_name}-notifications-dynamodb"
  role = aws_iam_role.notifications.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "dynamodb:PutItem"
        Resource = var.idempotency_table_arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "notifications_ssm" {
  name = "${var.project_name}-notifications-ssm"
  role = aws_iam_role.notifications.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "ssm:GetParameter"
        Resource = aws_ssm_parameter.brevo_api_key.arn
      }
    ]
  })
}
