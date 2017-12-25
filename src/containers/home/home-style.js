import styled from 'styled-components';

export default styled('div')`

  .user{
    padding: 0;
    width: 100%;
    .am-list-content{
      font-size: 10pt;
    }
    .am-list-line{
      padding-right: 5px;
    }
  }

  .am-navbar-left-icon{
    .am-button{
      color: white;
      background-color: transparent;
      padding: 0;
      border: none;
      :before{
        border: none;
      }
    }
  }

  .appDrawer {
    position: relative;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    /* .am-list-header{
      padding: 0;
      border-bottom: solid thin;
      .am-list-item{
        background-color: transparent;
      }
    }
    */
    /*
    .am-list-body{
      .am-list-item{
        .am-list-content{
          font-size: 10pt;
        }
      }
    } */
    }

  .appDrawer .am-drawer-sidebar {
    background-color: #fff;
    overflow: auto;
    z-index: 3;
    -webkit-overflow-scrolling: touch;
  }
  /* .appDrawer .am-drawer-sidebar .am-list {
    padding: 0;
  } */

  /* .appDrawer .am-drawer-content {

    color: ${props=>props.theme.contentPane.textColor};
    text-align: center;

    .am-drawer-draghandle {
      background-color: rgba(50, 50, 50, 0);
    }
  } */

`;

