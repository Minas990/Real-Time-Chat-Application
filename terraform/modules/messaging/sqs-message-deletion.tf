resource "aws_sqs_queue" "message_deletion_dlq" {
  name                      = "${var.project_name}-message-deletion-dlq"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Name = "${var.project_name}-message-deletion-dlq"
  }
}

resource "aws_sqs_queue" "message_deletion" {
  name                       = "${var.project_name}-message-deletion-queue"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 345600 # 4 days

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.message_deletion_dlq.arn
    maxReceiveCount     = 5
  })

  tags = {
    Name = "${var.project_name}-message-deletion-queue"
  }
}

resource "aws_sqs_queue_policy" "message_deletion" {
  queue_url = aws_sqs_queue.message_deletion.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "sns.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.message_deletion.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.user_events.arn
          }
        }
      }
    ]
  })
}

# Only receives user.deleted events.
resource "aws_sns_topic_subscription" "message_deletion" {
  topic_arn = aws_sns_topic.user_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.message_deletion.arn

  filter_policy = jsonencode({
    eventType = ["user.deleted"]
  })
}
