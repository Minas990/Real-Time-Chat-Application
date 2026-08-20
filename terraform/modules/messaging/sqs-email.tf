resource "aws_sqs_queue" "email_dlq" {
  name                      = "${var.project_name}-email-dlq"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Name = "${var.project_name}-email-dlq"
  }
}

resource "aws_sqs_queue" "email" {
  name                       = "${var.project_name}-email-queue"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 345600 # 4 days

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.email_dlq.arn
    maxReceiveCount     = 5
  })

  tags = {
    Name = "${var.project_name}-email-queue"
  }
}

resource "aws_sqs_queue_policy" "email" {
  queue_url = aws_sqs_queue.email.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "sns.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.email.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.user_events.arn
          }
        }
      }
    ]
  })
}

# both user.created (welcome email) and user.deleted (goodbye email).
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.user_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.email.arn

  filter_policy = jsonencode({
    eventType = ["user.created", "user.deleted"]
  })
}
