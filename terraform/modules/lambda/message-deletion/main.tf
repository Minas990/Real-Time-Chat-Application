data "archive_file" "message_deletion" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/build/message-deletion.zip"
}

resource "aws_lambda_function" "message_deletion" {
  function_name    = "${var.project_name}-message-deletion"
  filename         = data.archive_file.message_deletion.output_path
  source_code_hash = data.archive_file.message_deletion.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256
  role             = aws_iam_role.message_deletion.arn

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_sg_id]
  }

  environment {
    variables = {
      DB_HOST     = var.db_host
      DB_PORT     = tostring(var.db_port)
      DB_NAME     = var.db_name
      DB_USERNAME = var.db_username
      DB_PASSWORD = var.db_password
    }
  }

  tags = {
    Name = "${var.project_name}-message-deletion"
  }
}

resource "aws_lambda_event_source_mapping" "message_deletion" {
  event_source_arn        = var.message_deletion_queue_arn
  function_name            = aws_lambda_function.message_deletion.arn
  batch_size                = 5
  function_response_types = ["ReportBatchItemFailures"]
}
