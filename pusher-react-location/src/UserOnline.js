import React from 'react';
import { size, map } from 'lodash';

import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';

const UserOnline = ({ userOnline }) => {
  const renderMembers = () => {
    return map(userOnline, (value, key) => (
      <Chip key={key} avatar={<Avatar>{key[0]}</Avatar>} label={key} />
    ));
  };

  return (
    <div>
      <Paper style={{ padding: '10px', marginBottom: '10px' }}>
        UserOnline: {size(userOnline)}
      </Paper>
      <Paper style={{ padding: '10px' }}>{renderMembers()}</Paper>
    </div>
  );
};

export default UserOnline;
