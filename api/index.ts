export default async function handler(req: any, res: any) {
  const { app } = await import('../back/src/app');
  app(req, res);
}
