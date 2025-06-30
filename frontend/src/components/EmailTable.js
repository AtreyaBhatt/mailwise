import React from "react";
import PriorityBadge from "./PriorityBadge";

const EmailTable = ({ emails }) => {
  if (!emails || emails.length === 0) return null;

  return (
    <table className="email-table">
      <thead>
        <tr>
          <th>Sender</th>
          <th>Subject</th>
          <th>Summary</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        {emails
          .sort((a, b) => b.priority - a.priority)
          .map((email, idx) => (
            <tr key={idx}>
              <td>{email.sender}</td>
              <td>{email.subject}</td>
              <td>{email.summary}</td>
              <td>
                <PriorityBadge priority={email.priority} />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default EmailTable;
