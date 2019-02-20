import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Icon from '@material-ui/core/Icon';
import {Link} from "react-router-dom";

const styles = theme => ({
    fab: {
        margin: 0,
        top: 'auto',
        right: 40,
        bottom: 40,
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
      <Link to="/surveys/new">
        <Fab color="primary" aria-label="Add" className={classes.fab}>
          <AddIcon />
        </Fab>
        </Link>
      </div>
    );
  }
  
  FloatingActionButtons.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(FloatingActionButtons);