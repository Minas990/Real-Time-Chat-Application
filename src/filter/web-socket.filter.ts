import { Catch, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch(WsException)
export class WsExceptionsFilter extends BaseWsExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        const ctx = host.switchToWs();
        const client = ctx.getClient();
        const data = ctx.getData();

        client.emit('exception', {
            message: exception.getError(),
            data,
        });
  }
}
