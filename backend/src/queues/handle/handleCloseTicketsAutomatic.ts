import * as Sentry from '@sentry/node'
import { CronJob } from "cron";
import prisma from "../../prisma/client";
import { ClosedAllOpenTickets } from "src/services/wbot/wbotClosedTickets";
import { logger } from 'src/utils/Logger';

async function handleCloseTicketsAutomatic() {
  const job = new CronJob('*/1 * * * *', async () => {
    const companies = await prisma.company.findMany();
    companies.map(async c => {
      try {
        const companyId = c.id;
        await ClosedAllOpenTickets(companyId);
      } catch (e: any) {
        Sentry.captureException(e);
        logger.error("ClosedAllOpenTickets -> Verify: error", e.message);
        throw e;
      }
    });
  });
  job.start()
}

export default handleCloseTicketsAutomatic