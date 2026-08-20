resource "aws_security_group" "lambda_message_deletion" {
  name        = "${var.project_name}-lambda-message-deletion-sg"
  description = "VPC-attached message-deletion Lambda, needs egress to RDS"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-lambda-message-deletion-sg"
  }
}
