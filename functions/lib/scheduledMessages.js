import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
initializeApp();
const db = getFirestore();
export const processScheduledMessages = onSchedule({ schedule: '* * * * *', timeZone: 'America/Sao_Paulo' }, async () => {
    const now = new Date();
    const snapshot = await db
        .collection('messages')
        .where('status', '==', 'scheduled')
        .where('scheduledAt', '<=', now)
        .get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
            status: 'sent',
            sentAt: FieldValue.serverTimestamp(),
        });
    });
    await batch.commit();
});
