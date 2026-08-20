resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg"
  description = "ElastiCache Redis, reachable from user-service and chat-service"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Redis from user-service"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.user_service.id]
  }

  ingress {
    description     = "Redis from chat-service"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.chat_service.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-redis-sg"
  }
}
