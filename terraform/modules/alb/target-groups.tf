resource "aws_lb_target_group" "user_service" {
  name     = "${var.project_name}-user-svc-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }

  tags = {
    Name = "${var.project_name}-user-svc-tg"
  }
}

resource "aws_lb_target_group" "chat_service" {
  name     = "${var.project_name}-chat-svc-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  #Sticky sessions are required for WebSocket connections even though we implement redis pub/sub
  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }

  tags = {
    Name = "${var.project_name}-chat-svc-tg"
  }
}
