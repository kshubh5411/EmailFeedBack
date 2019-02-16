import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Icon from '@material-ui/core/Icon'

const styles = theme => ({
    fab: {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
    },
    extendedIcon: {
      marginRight: theme.spacing.unit,
    },
  });
  function FloatingActionButtons(props) {
    const { classes } = props;
    return (
      <div>
        <Fab color="primary" aria-label="Add" className={classes.fab}>
          <AddIcon />
        </Fab>
      </div>
    );
  }
  
  FloatingActionButtons.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(FloatingActionButtons);