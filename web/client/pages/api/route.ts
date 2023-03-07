import { NextApiRequest, NextApiResponse } from 'next';
import { createProxyMiddleware } from 'http-proxy-middleware';

const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3030',
  changeOrigin: true,
});

export default function handler(req: NextApiRequest, res: NextApiResponse, next: Function) {
  return apiProxy(req, res, next);
}
