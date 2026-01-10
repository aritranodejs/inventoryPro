import mongoose from 'mongoose';

export const withTransaction = async <T>(
    operation: (session: mongoose.ClientSession) => Promise<T>,
    maxRetries: number = 3
): Promise<T> => {
    let attempt = 0;

    while (attempt < maxRetries) {
        let session: mongoose.ClientSession | null = null;
        try {
            session = await mongoose.startSession();
        } catch (err) {
            console.warn('Could not start session, running operation without transaction.');
            return await operation(null as any);
        }

        try {
            session.startTransaction();
        } catch (error: any) {
            if (error.message && error.message.includes('Transaction numbers are only allowed on a replica set member')) {
                console.warn('MongoDB running as standalone. Executing operation without transaction.');
                await session.endSession();
                return await operation(null as any);
            }
            throw error;
        }

        try {
            const result = await operation(session);
            await session.commitTransaction();
            return result;
        } catch (error: any) {
            if (error.message && (
                error.message.includes('Transaction numbers are only allowed on a replica set member') ||
                error.message.includes('This MongoDB deployment does not support retryable writes')
            )) {
                console.warn('MongoDB running as standalone (no replica set). Retrying operation without transaction.');
                try {
                    await session.abortTransaction();
                    await session.endSession();
                } catch (ignored) {
                }
                return await operation(undefined as any);
            }

            try {
                await session.abortTransaction();
            } catch (ign) { }

            if (error.code === 112 || error.code === 11000) {
                attempt++;
                if (attempt >= maxRetries) throw error;
                await new Promise(resolve => setTimeout(resolve, 100 * attempt));
            } else {
                throw error;
            }
        } finally {
            try {
                await session.endSession();
            } catch (e) { }
        }
    }

    throw new Error('Transaction failed after max retries');
};
