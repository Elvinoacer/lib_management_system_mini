
import IntaSend from 'intasend-node'

export const intasend = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY!,
  process.env.INTASEND_SECRET_KEY!,
  process.env.INTASEND_TEST_MODE === 'true' // test mode based on env, not NODE_ENV
)
