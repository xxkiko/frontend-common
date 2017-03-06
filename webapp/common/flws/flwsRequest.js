/**
 * Created by christ on 2016/12/5.
 */

//初始化DATA对象 ajax 数据请求信息  DX 嫌疑对象信息 CQBG 呈请报告信息
var DATA = {"ajax": {"count": "0"}, "DX": {}, "CQBG": {}, 'FLWS': {}};

/**
 * 请求获取呈请报告数据，判断该数据是否存在，如果存在保存既修改，如果不存在，保存既新增
 */
function queryCqbgData(render) {
    if (DATA.CQBG.cqbgData) {
        $.ajax({
            url: DATA.CQBG.cqbgData.queryUrl,
            data: {
                CQZT: '0',
                ASJBH: DATA.asjbh,
                FLWS_ASJFLWSDM: DATA.CQBG.cqbgData.bianMa,
                XT_ZXBZ: '0'
            },
            jsonType: 'json',
            success: function (data) {
                var json = eval('(' + data + ')');
                if (json.state == 'success') {
                    if (json.rows.length > 0) {//有数据 编辑
                        DATA.CQBG.cqbgRow = json.rows[0];
                        DATA.CQBG.status.hasDone = true;
                        if (DATA.CQBG.cqbgRow.XXZJBH == undefined) {
                            DATA.CQBG.cqbgZj = DATA.CQBG.cqbgRow.ZJ;
                        } else {
                            DATA.CQBG.cqbgZj = DATA.CQBG.cqbgRow.XXZJBH;
                        }
                    } else {//没有数据 新增
                        DATA.CQBG.cqbgRow = {};
                    }

                    render();
                } else if (json.state == 'error') {
                    console.log('error');
                }
            }
        })
    }
}

/**
 * 请求获取法律文书数据，判断该数据是否存在，如果存在保存既修改，如果不存在，保存既新增
 * @param title 当前tab窗口
 */
function queryFlwsData(title, render) {
    var flwsData = DATA.FLWS.flwsData;//法律文书数据
    if (flwsData) {
        //操作当前tab下的查询
        for (var k in flwsData) {
            if (title == flwsData[k].name) {
                var param = {};//参数
                if (DATA.FLWS[flwsData[k].bianMa] == undefined) {
                    DATA.FLWS[flwsData[k].bianMa] = {};
                }
                if (DATA.FLWS[flwsData[k].bianMa]['status'] == undefined) {
                    DATA.FLWS[flwsData[k].bianMa]['status'] = {};
                }

                DATA.FLWS[flwsData[k].bianMa].flwsData = flwsData[k];
                DATA.FLWS[flwsData[k].bianMa].params = {};
                var only = DATA.CQBG.cqbgZj == undefined || DATA.FLWS[flwsData[k].bianMa].flwsData.only;
                var one = DATA.FLWS[flwsData[k].bianMa].flwsData.one;
                if (one) {//只能出一份文书
                    param = {
                        XT_ZXBZ: '0',
                        ASJBH: DATA.asjbh
                    }
                } else {//出多份文书
                    param = {
                        CQBG_ZJ: DATA.CQBG.cqbgZj,
                        XT_ZXBZ: '0',
                        ASJBH: DATA.asjbh
                    }
                }

                $.ajax({
                    url: flwsData[k].queryUrl,
                    data: param,
                    dataType: 'json',
                    success: function (json) {
                        //console.log(json)
                        if (json.state == 'success') {
                            if (json.rows != undefined && json.rows.length > 0) {//有数据 执行编辑渲染

                                if (one) {
                                    DATA.FLWS[flwsData[k].bianMa].status.hasDone = true;
                                    //TODO 只能做一份儿
                                    //DATA.FLWS[flwsData[k].bianMa].status.disabled = true;
                                }else if (only) {
                                    for (var i = 0; i < json.rows.length; i++) {
                                        if (json.rows[i].CQZT == 0 && json.rows[i].CQBG_ZJ == DATA.CQBG.cqbgZj) {
                                            DATA.FLWS[flwsData[k].bianMa].status.hasDone = true;
                                            break;
                                        }
                                    }
                                } else {
                                    DATA.FLWS[flwsData[k].bianMa].status.hasDone = true;
                                }

                                DATA.FLWS[flwsData[k].bianMa].flwsRow = json.rows;

                            } else {//没有数据 执行新增渲染
                                DATA.FLWS[flwsData[k].bianMa].flwsRow = [];
                                if(window["render"+flwsData[k].bianMa+"CustomizedPageForNone"]){
                                    eval("render"+flwsData[k].bianMa+"CustomizedPageForNone()");
                                }

                            }

                            render(flwsData[k].bianMa);
                        } else if (json.state == 'error') {
                            console.log('error');
                        }
                    }
                });
                break;
            }
        }
    }
}

/**
 * 获取嫌疑对象信息(需要修改)
 */
function getDxxxData(render) {
    //有无呈请报告的判断
    if (DATA.CQBG == undefined || DATA.CQBG.cqbgData == undefined || DATA.CQBG.cqbgData.dxbm == undefined) {
        for (var key in DATA.FLWS.flwsData) {
            if (DATA.FLWS.flwsData[key].dxbm != undefined) {
                DATA.DX.dxbm = DATA.FLWS.flwsData[key].dxbm;
            }
            if (DATA.FLWS.flwsData[key].wdx != undefined) {
                DATA.DX.wdx = DATA.FLWS.flwsData[key].wdx;
            }
        }

    } else {
        if (DATA.CQBG.cqbgData.dxbm) {
            DATA.DX.dxbm = DATA.CQBG.cqbgData.dxbm;
        }
        if (DATA.CQBG.cqbgData.wdx) {
            DATA.DX.wdx = DATA.CQBG.cqbgData.wdx;
        }
    }
    if (DATA.DX.dxbm && !DATA.DX.wdx) {//有嫌疑对象
        $.ajax({
            url: pathConfig.basePath + '/api/dtbm/' + DATA.DX.dxbm + '/getByForeignKey/ASJBH/' + DATA.asjbh,
            type: 'get',
            success: function (json) {
                if (json) {
                    DATA.DX.xydxData = json;
                    DATA.DX.hasData = true;
                    for (var key in DATA.DX.xydxData) {
                        if (DATA.DX.xydxData[key] == undefined || DATA.DX.xydxData[key] == null) {
                            DATA.DX.xydxData[key] = [];
                        }
                        //嫌疑人前后置关系的判断
                        if (DATA.DX.xydxData[anjianXyDxDic.xyr] != undefined) {
                            var xyr_rsqzcsdm;
                            for (var i = 0; i < DATA.DX.xydxData[anjianXyDxDic.xyr].length; i++) {
                                var xyr = DATA.DX.xydxData[anjianXyDxDic.xyr][i];
                                if(xyr[flwsQhzgxXyrPz] == null || xyr[flwsQhzgxXyrPz] == 'null'){
                                    xyr_rsqzcsdm = '0000';
                                }else{
                                    xyr_rsqzcsdm = xyr[flwsQhzgxXyrPz];
                                }
                                var rule = DATA.RULE[xyr_rsqzcsdm];
                                var disabled = "";
                                var title = "";
                                if (rule != undefined) {
                                    if (rule.iscontain) {
                                        for (var z = 0; z < rule.item.length; z++) {
                                            if (DATA.CQBG.asjflwsdm == rule.item[z]) {
                                                disabled = "disabled ='disabled'";
                                                title = "title = '" + rule.message + "'";
                                                break;
                                            }
                                        }
                                    } else {
                                        disabled = "disabled='disabled'";
                                        title = "title = '" + rule.message + "'";
                                        for (var z = 0; z < rule.item.length; z++) {
                                            if (DATA.CQBG.asjflwsdm == rule.item[z]) {
                                                disabled = "";
                                                title = "";
                                            }
                                        }
                                    }
                                }
                                xyr.disabled = disabled;
                                xyr.title = title;
                            }
                        }
                    }
                }

                if(DATA.CQBG.cqbgData){
                    if (DATA.CQBG.cqbgData.bx && !DATA.DX.hasData) {
                        loading('open', '必选嫌疑对象列表不能为空')
                    } else {
                        render();
                    }
                }
            }
        })
    } else {//无嫌疑对象
        xydxHide();
    }
}

/**
 * 呈请报告  保存函数
 * @param data
 */
function cqbgSaveComplete(data) {
    //loading('close');//完成后关闭...转圈
    if (data) {
        var json = eval('(' + data + ')');
        if (json.state == 'success') {
            if (DATA.CQBG.cqbgZj == undefined) {
                DATA.CQBG.cqbgZj = json.ID;
            }
            $.messager.show({
                title: '提示',
                msg: '呈请报告保存成功'
            });
        } else if (json.state == 'error') {
            $.messager.show({
                title: '提示',
                msg: '呈请报告保存失败'
            });
        }
    }
}
function cqbgSave(url, param) {
    if (DATA.CQBG.cqbgData.customized) {
        eval("save" + DATA.CQBG.cqbgData.bianMa + "CustomizedPage('" + url + "','" + JSON.stringify(param) + "','cqbgSaveComplete');");
    } else {
        $.ajax({
            url: url,
            data: param,
            success: function (data) {
                cqbgSaveComplete(data);
            }
        });
    }

}

function flwsSaveComplete(data, bm) {
    //loading('close');//完成后关闭...转圈
    if (data) {
        var json = eval('(' + data + ')');
        if (json.state == 'success') {
            if (json.ID != undefined || json.ID) {
                queryFlwsData(DATA.FLWS.title, flwsPageRender);
                DATA.FLWS[bm].status.currentFlwsId = json.ID;
                DATA.FLWS[bm].status.hasDone = true;

                //TODO 执法公开的单独处理(只针对行政案件)
                if(bm == 'X020003'){
                    DATA.FLWS[bm].status.zfgked = false;
                }
            }
            $.messager.show({
                title: '提示',
                msg: '法律文书保存成功'
            });
        } else if (json.state == 'error') {
            $.messager.show({
                title: '提示',
                msg: '法律文书保存失败'
            });
        }
    }
}
/**
 * 法律文书  保存函数
 * @param url 保存url
 * @param param 参数
 * @param bm 编码
 */
function flwsSave(url, param, bm) {
    if (DATA.FLWS[bm].flwsData.customized) {
        eval("save" + bm + "CustomizedPage('" + url + "','" + JSON.stringify(param) + "','flwsSaveComplete', '" + bm + "');");
    } else {
        $.ajax({
            url: url,
            data: param,
            success: function (data) {
                flwsSaveComplete(data, bm);
            }
        });
    }

}

/**
 * 生成法律文书请求(需要修改)
 */
function scflwsRequest(params){
    $.ajax({
        url: pathConfig.basePath +'/workflowRelated/createXwFlwsscrwb',
        data:params,
        success: function (data) {
            var json = eval('('+data+')');
            if(json.status == 'success'){
                $.messager.alert({
                    title: '提示',
                    msg: '生成法律文书成功',
                    fn: function () {
                        crossCloseTab();
                    }
                });
            }else if(json.status == 'error'){
                $.messager.alert({
                    title: '提示',
                    msg: '生成法律文书失败',
                    fn: function () {
                        crossCloseTab();
                    }
                });
            }
        }
    })
}