import { mappingFormItem } from '@/utils/formItemUtils';
// 元素属性配置
export const Options = {
    attributes: [
        mappingFormItem('Tabs', {
            children: [
                mappingFormItem('TabPane', {
                    name: 'AttributeContainer.FormItem.Audio.Attribute',
                    children: [
                        mappingFormItem('Collapse', {
                            children: [
                                // mappingFormItem('CollapsePane', {
                                //     name: '基础',
                                //     children: [
                                //         mappingFormItem('Boolean', { name: '静音', mappingKey: 'silent', defaultValue: false })
                                //     ]
                                // })
                                mappingFormItem('Slider', {
                                    attr: {
                                        min: 1,
                                        max: 200,
                                        step: 1
                                    }, name: 'AttributeContainer.FormItem.Audio.Volume', mappingKey: 'volume', defaultValue: 100, label: '%'
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