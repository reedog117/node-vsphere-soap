node-vsphere-soap
==============

This is a library to connect to vCenter servers and/or ESXi hosts and perform operations using the vSphere Web Services SDK.

This is very much in alpha. 


Sample Code
--------------

To connect to a vCenter server.

    require('node-vsphere-soap');
    var vcServerInstance = new vCenterConnectionInstance(host, user, password, false);


