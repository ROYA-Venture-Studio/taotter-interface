import React from 'react';
import styles from './ChatMessage.module.css';
import Avatar from '../Avatar/Avatar';

export default function ChatMessage({ message }) {
  const { user, content, timestamp, isOwnMessage, hasImage } = message;

  // Support for multi-line content
  const contentArray = Array.isArray(content) ? content : [content];

  return (
    <div className={`${styles.messageRow} ${isOwnMessage ? styles.own : styles.other}`}>
      {!isOwnMessage && user && (
        <div className={styles.avatarWrapper}>
          <Avatar user={user} size="medium" />
        </div>
      )}
      <div className={styles.messageContent}>
        {hasImage && (
          <div className={styles.imagePlaceholder}></div>
        )}
        {contentArray.map((line, idx) => (
          <div key={idx} className={styles.bubble}>
            <span>{line}</span>
          </div>
        ))}
        <span className={styles.timestamp}>{timestamp}</span>
      </div>
    </div>
  );
}
