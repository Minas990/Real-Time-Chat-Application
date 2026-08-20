data "archive_file" "notifications" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/build/notifications.zip"
}

resource "aws_lambda_function" "notifications" {
  function_name    = "${var.project_name}-notifications"
  filename         = data.archive_file.notifications.output_path
  source_code_hash = data.archive_file.notifications.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256
  role             = aws_iam_role.notifications.arn

  environment {
    variables = {
      IDEMPOTENCY_TABLE_NAME = var.idempotency_table_name
      BREVO_API_KEY_PARAM    = aws_ssm_parameter.brevo_api_key.name
      BREVO_SENDER_EMAIL     = var.brevo_sender_email
    }
  }

  tags = {
    Name = "${var.project_name}-notifications"
  }
}


resource "aws_lambda_event_source_mapping" "notifications" {
  event_source_arn                  = var.email_queue_arn
  function_name                     = aws_lambda_function.notifications.arn
  batch_size                        = 10
  maximum_batching_window_in_seconds = 30
  function_response_types           = ["ReportBatchItemFailures"]
}
