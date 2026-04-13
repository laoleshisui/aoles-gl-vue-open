import {transitionMap } from '@/utils/effect';
import { mappingFormItem } from '@/utils/formItemUtils';
// 元素属性配置
export const Options = {
    attributes: [
        mappingFormItem('Tabs', {
            children: [
                mappingFormItem('TabPane', {
                    name: 'AttributeContainer.FormItem.Video.Attribute',
                    children: [
                        mappingFormItem('Collapse', {
                            defaultValue: [0],
                            children: [
                                mappingFormItem('CollapsePane', {
                                    name: 'AttributeContainer.FormItem.Video.Position',
                                    children: [
                                        mappingFormItem('Flex', {
                                            attr: { col: 2 }, name: 'AttributeContainer.FormItem.Video.Coordinate', children: [
                                                mappingFormItem('Number', {
                                                    attr: {
                                                        controlsPosition: 'right'
                                                    }, name: 'AttributeContainer.FormItem.Video.CenterX', mappingKey: 'centerX', defaultValue: 0
                                                }),
                                                mappingFormItem('Number', {
                                                    attr: {
                                                        controlsPosition: 'right'
                                                    }, name: 'AttributeContainer.FormItem.Video.CenterY', mappingKey: 'centerY', defaultValue: 0
                                                }),
                                            ]
                                        }),
                                        mappingFormItem('Number', {
                                            attr: {
                                            }, name: 'AttributeContainer.FormItem.Video.Rotation', mappingKey: 'rotation', defaultValue: 0
                                        }),
                                        mappingFormItem('Number', {
                                            attr: {
                                                step: 1
                                            }, name: 'AttributeContainer.FormItem.Video.ScaleX', mappingKey: 'scale', defaultValue: 100
                                        }),
                                        mappingFormItem('Number', {
                                            attr: {
                                                step: 1
                                            }, name: 'AttributeContainer.FormItem.Video.ScaleY', mappingKey: 'scaleY', defaultValue: 100
                                        })
                                    ]
                                })
                            ]
                        }),
                        // mappingFormItem('Collapse', {
                        //     children: [
                        //         mappingFormItem('CollapsePane', {
                        //             name: '基础',
                        //             children: [
                        //                 mappingFormItem('Boolean', { name: '静音', mappingKey: 'silent', defaultValue: false })
                        //             ]
                        //         })
                        //     ]
                        // })
                    ]
                }),
                mappingFormItem('TabPane', {
                    name: 'AttributeContainer.FormItem.Video.Effect',
                    children: [
                        mappingFormItem('Select', { attr: {
                                controlsPosition: 'right'
                            }, name: 'AttributeContainer.FormItem.Video.Transition', mappingKey: 'transition', 
                            options: transitionMap,//only use label & value.
                            ownSelectOptionsKey: 'ownTransitionMap',
                        }),
                        mappingFormItem('Collapse', {
                            defaultValue: [0],
                            children: [
                                mappingFormItem('CollapsePane', {
                                    name: 'AttributeContainer.FormItem.Video.EffectList',
                                    showCount: true,
                                    updateKey: 'UpdateVideoEffectList',
                                    children: []
                                })
                            ]
                        }),
                        mappingFormItem('Grid', {
                            children:[
                                mappingFormItem('Button', {
                                    name: 'AttributeContainer.FormItem.Video.HFlip',
                                    covor: "/image/cover/effect_cover.png",
                                    mappingKey: "effectList",
                                    targetListUpdateKey: "UpdateVideoEffectList",
                                    data:{
                                        name: 'AttributeContainer.FormItem.Video.HFlip',
                                        path: "/glsl/video/effect/hflip.glsl",
                                        type: "video",
                                        transition_type: "effect",
                                        uniforms: [
                                            {
                                                name: 'flipIntensity',
                                                type: 'float',
                                                value: 1.0,
                                                min: 0.0,
                                                max: 1.0,
                                                step: 0.1,
                                                label: '翻转强度',
                                                description: '控制水平翻转的强度，0=不翻转，1=完全翻转'
                                            },
                                        ]
                                    }
                                }),
                            ]
                        }),
                    ]
                })
            ]
        })
    ]
};