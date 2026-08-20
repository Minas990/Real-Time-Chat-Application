resource "aws_sns_topic" "user_events" {
  name = "${var.project_name}-user-events"

  tags = {
    Name = "${var.project_name}-user-events"
  }
}
