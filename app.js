const fs = require('fs');
const redis = require('redis');
const dayjs = require('dayjs');

const dbKey = 'my-app-log-info';
const logFilePath = 'C:/Users/user/Desktop/university/DevOps/cron_jobs/log_file.log';

const formatDate = (date) => dayjs(date).format('DD-MM-YYYY HH:mm:ss');

const processLogAndStoreInRedis = async () => {
	fs.stat(logFilePath, async (err, stats) => {
		const redisClient = await redis.createClient({ url: 'redis://@127.0.0.1:6379' }).connect();

		if (err) {
			console.error('Помилка читання файлу: ' + err);
			return;
		}

		const oldData = JSON.parse(await redisClient.get(dbKey) || '{}');

		const fileSize = stats.size;
		const lastModified = formatDate(stats.mtime);

		if (oldData.lastModified !== lastModified) {
			await redisClient.set(dbKey, JSON.stringify({
				fileSize,
				lastModified,
			}));

			console.log('Інформацію записано в Redis.');
		}

		process.exit();
	});
};

processLogAndStoreInRedis();
