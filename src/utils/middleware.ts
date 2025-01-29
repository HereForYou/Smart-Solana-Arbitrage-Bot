import { MyContext } from '../config/types';

/**
 *
 * @param {Context} ctx
 * @param {() => Promise<void>} next
 * @param {string} action
 */
export async function checkAction(ctx: MyContext, next: () => Promise<void>, action: string) {
  try {
    if (ctx.session.state === action && ctx.session.msgId === ctx.msgId) {
      return;
    }
    ctx.session.state = action;
    ctx.session.msgId = ctx.msgId;
    return next();
  } catch (error) {
    console.error('Error while checkAction:', error);
  }
}
