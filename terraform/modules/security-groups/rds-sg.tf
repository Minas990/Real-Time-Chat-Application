resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "RDS Postgres, reachable from chat-service and message-deletion Lambda only"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Postgres from chat-service"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.chat_service.id]
  }

  ingress {
    description     = "Postgres from message-deletion Lambda"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda_message_deletion.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}
