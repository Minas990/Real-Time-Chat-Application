module "network" {
  source = "./modules/network"

  project_name          = var.project_name
  aws_region            = var.aws_region
  vpc_cidr              = var.vpc_cidr
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
}

module "security_groups" {
  source = "./modules/security-groups"

  project_name = var.project_name
  vpc_id       = module.network.vpc_id
}

module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  alb_sg_id         = module.security_groups.alb_sg_id
}

module "data_s3" {
  source = "./modules/data-s3"

  project_name  = var.project_name
  bucket_suffix = random_id.bucket_suffix.hex
}

module "data_dynamodb" {
  source = "./modules/data-dynamodb"

  project_name = var.project_name
}

module "data_redis" {
  source = "./modules/data-redis"

  project_name        = var.project_name
  private_subnet_ids  = module.network.private_subnet_ids
  redis_sg_id         = module.security_groups.redis_sg_id
  redis_node_type     = var.redis_node_type
}

module "data_rds" {
  source = "./modules/data-rds"

  project_name        = var.project_name
  private_subnet_ids  = module.network.private_subnet_ids
  rds_sg_id           = module.security_groups.rds_sg_id
  rds_instance_class  = var.rds_instance_class
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
}

module "messaging" {
  source = "./modules/messaging"

  project_name = var.project_name
}

module "compute_user_service" {
  source = "./modules/compute-user-service"

  project_name        = var.project_name
  instance_type       = var.user_service_instance_type
  private_subnet_ids  = module.network.private_subnet_ids
  user_service_sg_id  = module.security_groups.user_service_sg_id
  target_group_arn    = module.alb.user_service_tg_arn
  users_table_arn     = module.data_dynamodb.users_table_arn
  media_bucket_arn    = module.data_s3.bucket_arn
  sns_topic_arn       = module.messaging.sns_topic_arn
}

module "compute_chat_service" {
  source = "./modules/compute-chat-service"

  project_name        = var.project_name
  instance_type       = var.chat_service_instance_type
  private_subnet_ids  = module.network.private_subnet_ids
  chat_service_sg_id  = module.security_groups.chat_service_sg_id
  target_group_arn    = module.alb.chat_service_tg_arn
  media_bucket_arn    = module.data_s3.bucket_arn
}

module "lambda_notifications" {
  source = "./modules/lambda/notifications"

  project_name            = var.project_name
  email_queue_arn         = module.messaging.email_queue_arn
  idempotency_table_name  = module.data_dynamodb.notifications_idempotency_table_name
  idempotency_table_arn   = module.data_dynamodb.notifications_idempotency_table_arn
  brevo_api_key           = var.brevo_api_key
  brevo_sender_email      = var.brevo_sender_email
}

module "lambda_message_deletion" {
  source = "./modules/lambda/message-deletion"

  project_name                = var.project_name
  private_subnet_ids          = module.network.private_subnet_ids
  lambda_sg_id                = module.security_groups.lambda_message_deletion_sg_id
  message_deletion_queue_arn  = module.messaging.message_deletion_queue_arn
  db_host                     = module.data_rds.db_endpoint
  db_port                     = module.data_rds.db_port
  db_name                     = module.data_rds.db_name
  db_username                 = var.db_username
  db_password                 = var.db_password
}

# Bucket names must be globally unique - this generates a stable random
# suffix so re-running apply doesn't try to rename the bucket.
resource "random_id" "bucket_suffix" {
  byte_length = 4
}
