import { connect } from '@planetscale/database'

export const pscale_config = {
  url: process.env['DATABASE_URL']
}

export const conn = connect(pscale_config)
