var getSelectedData = function(grid) {
    var data = grid.getSelectedRowData();
    if (!data) {
        alert("please select records which you want to handle");
        return false;
    }
    return data;
};
var getSelectedAllData = function(grid) {
    var data = grid.getSelectedAllRowData();
    if (!data || !data.length) {
        alert("please select records which you want to handle");
        return false;
    }
    return data;
};
var getSelectedIds = function(rows) {
    var ids = [];
    rows.forEach(function(row) {
        ids.push(row.id||row._id);
    });
    return ids;
};


jQuery.fn.serializeObject = function() {
  var arrayData, objectData;
  arrayData = this.serializeArray();
  objectData = {};

  $.each(arrayData, function() {
    var value;

    if (this.value != null) {
      value = this.value;
    } else {
      value = '';
    }

    if (objectData[this.name] != null) {
      if (!objectData[this.name].push) {
        objectData[this.name] = [objectData[this.name]];
      }

      objectData[this.name].push(value);
    } else {
      objectData[this.name] = value;
    }
  });

  return objectData;
};