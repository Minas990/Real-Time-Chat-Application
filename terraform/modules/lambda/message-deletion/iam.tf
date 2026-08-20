resource "aws_iam_role" "message_deletion" {
  name = "${var.project_name}-message-deletion-lambda-role"

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

resource "aws_iam_role_policy_attachment" "message_deletion_basic_execution" {
  role       = aws_iam_role.message_deletion.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


resource "aws_iam_role_policy_attachment" "message_deletion_vpc_access" {
  role       = aws_iam_role.message_deletion.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "message_deletion_sqs" {
  name = "${var.project_name}-message-deletion-sqs"
  role = aws_iam_role.message_deletion.id

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
        Resource = var.message_deletion_queue_arn
      }
    ]
  })
}

