import { fontMap } from '@/utils/font';
import { mappingFormItem } from '@/utils/formItemUtils';
// 元素属性配置
export const Options = {
    attributes: [
        mappingFormItem('Tabs', {
            children: [
                mappingFormItem('TabPane', {
                    name: 'AttributeContainer.FormItem.Text.Attribute',
                    children: [
                        mappingFormItem('Collapse', {
                            defaultValue: [0, 1, 2],
                            children: [
                                mappingFormItem('CollapsePane', {
                                    name: 'AttributeContainer.FormItem.Text.SyncInTrack',
                                    children: [
                                        mappingFormItem('Boolean', { name: 'AttributeContainer.FormItem.Text.IsSyncInTrack', mappingKey: 'applyInTrack' }),
                                    ]
                                }),
                                mappingFormItem('CollapsePane', {
                                    name: 'AttributeContainer.FormItem.Text.Position',
                                    children: [
                                        mappingFormItem('Flex', { attr: { col: 2 }, name: 'AttributeContainer.FormItem.Text.Coordinate', children: [
                                                mappingFormItem('Number', { attr: {
                                                        controlsPosition: 'right'
                                                    }, name: 'AttributeContainer.FormItem.Text.CenterX', mappingKey: 'centerX', defaultValue: 0 }),
                                                mappingFormItem('Number', { attr: {
                                                        controlsPosition: 'right'
                                                    }, name: 'AttributeContainer.FormItem.Text.CenterY', mappingKey: 'centerY', defaultValue: 0 }),
                                            ] }),
                                        mappingFormItem('Number', { attr: {
                                        }, name: 'AttributeContainer.FormItem.Text.Rotation', mappingKey: 'rotation', defaultValue: 0 }),
                                        mappingFormItem('Number', {
                                            attr: {
                                                step: 1
                                            }, name: 'AttributeContainer.FormItem.Text.ScaleX', mappingKey: 'scale', defaultValue: 100
                                        }),
                                        mappingFormItem('Number', {
                                            attr: {
                                                step: 1
                                            }, name: 'AttributeContainer.FormItem.Text.ScaleY', mappingKey: 'scaleY', defaultValue: 100
                                        })
                                    ]
                                }),
                                mappingFormItem('CollapsePane', {
                                    name: 'AttributeContainer.FormItem.Text.Text',
                                    children: [
                                        mappingFormItem('Select', { attr: {
                                                controlsPosition: 'right'
                                            }, name: 'AttributeContainer.FormItem.Text.FontFamily', mappingKey: 'fontFamily', 
                                            options:fontMap
                                        }),
                                        mappingFormItem('Number', { attr: {
                                                controlsPosition: 'right'
                                            }, name: 'AttributeContainer.FormItem.Text.FontSize', mappingKey: 'fontSize'}),
                                        mappingFormItem('Number', { attr: {
                                                controlsPosition: 'right'
                                            }, name: 'AttributeContainer.FormItem.Text.StrokeWidth', mappingKey: 'strokeWidth'}),
                                        mappingFormItem('Number', { attr: {
                                                controlsPosition: 'right'
                                            }, name: 'AttributeContainer.FormItem.Text.TextPadding', mappingKey: 'textPadding'}),
                                        mappingFormItem('TextArea', { attr: {
                                                autosize: {
                                                    minRows: 1,
                                                    maxRows: 4
                                                },
                                                // placeholder: '点击修改'
                                            }, name: 'AttributeContainer.FormItem.Text.TextContent', mappingKey: 'name'}),
                                        mappingFormItem('Color', { name: 'AttributeContainer.FormItem.Text.TextColor', mappingKey: 'fill'}),
                                        mappingFormItem('Color', { name: 'AttributeContainer.FormItem.Text.StrokeColor', mappingKey: 'stroke'}),
                                        mappingFormItem('Color', { name: 'AttributeContainer.FormItem.Text.BackgroundColor', mappingKey: 'textBackgroundColor'})
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                // mappingFormItem('TabPane', {
                //     name: '动画',
                //     children: []
                // })
            ]
        })
    ]
};