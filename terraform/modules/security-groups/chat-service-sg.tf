resource "aws_security_group" "chat_service" {
  name        = "${var.project_name}-chat-service-sg"
  description = "chat-service ASG instances, reachable only from the ALB"
  vpc_id      = var.vpc_id

  ingress {
    description     = "WebSocket traffic from ALB"
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-chat-service-sg"
  }
}
