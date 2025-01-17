import React, { SyntheticEvent } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  CARD_TYPES,
  DEFAULT_CARD_SVG_LOGO
} from 'blockchain-wallet-v4-frontend/src/modals/BuySell/PaymentMethods/model'
import { InjectedFormProps, reduxForm } from 'redux-form'
import styled from 'styled-components'

import { fiatToString } from '@core/exchange/utils'
import { BSPaymentTypes, FiatType } from '@core/types'
import { Coin } from '@core/utils'
import { Box, Button, Text } from 'blockchain-info-components'
import { Expanded, Flex } from 'components/Flex'
import { SettingComponent, SettingContainer, SettingSummary } from 'components/Setting'
import { model } from 'data'
import { convertBaseToStandard } from 'data/components/exchange/services'
import { media } from 'services/styles'

import { CustomSettingHeader, RemoveButton } from '../styles'
import { Props as OwnProps, SuccessStateType } from '.'

const { FORM_BS_CHECKOUT_CONFIRM } = model.components.buySell

const CustomSettingContainer = styled(SettingContainer)`
  ${media.atLeastLaptopL`
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  `}
`
const CustomSettingComponent = styled(SettingComponent)`
  margin-top: 36px;
  ${media.tablet`
    margin-top: 8px;
  `}
`
const CardImg = styled.img`
  margin-right: 14px;
  width: 24px;
`

const Success: React.FC<
  InjectedFormProps<{}, Props & { fiatCurrency?: FiatType }> & Props & { fiatCurrency?: FiatType }
> = (props) => {
  const ccPaymentMethod = props.paymentMethods.methods.find(
    (m) => m.type === BSPaymentTypes.PAYMENT_CARD
  )

  const activeCards = props.cards.filter((card) => card.state === 'ACTIVE')

  return (
    <CustomSettingContainer>
      <SettingSummary>
        <CustomSettingHeader>
          <FormattedMessage id='scenes.settings.linked_cards' defaultMessage='Linked Cards' />
        </CustomSettingHeader>

        {!activeCards.length && (
          <Text size='14px' color='grey600' weight={500}>
            <FormattedMessage
              id='scenes.settings.no_credit_cards'
              defaultMessage='No Credit Cards'
            />
          </Text>
        )}
        {activeCards.map((card) => {
          const cardType = CARD_TYPES.find(
            (cardType) => cardType.type === (card.card ? card.card.type : '')
          )

          if (card.state !== 'ACTIVE') return

          const cardLabel = (card?.card.label && card?.card.label.toLowerCase()) || card?.card.type

          return (
            <Box isMobile={media.mobile} key={card.id} style={{ width: '430px' }}>
              <Flex style={{ width: '100%' }} gap={8}>
                <Flex alignItems='center'>
                  <CardImg src={cardType ? cardType.logo : DEFAULT_CARD_SVG_LOGO} />
                </Flex>

                <Expanded style={{ minWidth: 0 }}>
                  <Flex flexDirection='column'>
                    <Flex justifyContent='space-between'>
                      <Text
                        size='16px'
                        color='grey800'
                        weight={600}
                        capitalize
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {cardLabel}
                      </Text>

                      <Text size='14px' color='grey600' weight={500}>
                        ****{card.card.number}
                      </Text>
                    </Flex>

                    <Flex justifyContent='space-between'>
                      <Text size='14px' color='grey600' weight={500}>
                        {!!ccPaymentMethod && (
                          <FormattedMessage
                            id='scenes.settings.card_limits'
                            defaultMessage='{limitAmount} Limit'
                            values={{
                              limitAmount: fiatToString({
                                unit: card.currency,
                                value: convertBaseToStandard(Coin.FIAT, ccPaymentMethod.limits.max)
                              })
                            }}
                          />
                        )}
                      </Text>

                      <Text size='14px' color='grey600' weight={500}>
                        Exp: {card.card.expireMonth}/{card.card.expireYear}
                      </Text>
                    </Flex>
                  </Flex>
                </Expanded>

                <Flex alignItems='center'>
                  <RemoveButton
                    data-e2e='removeCard'
                    nature='light-red'
                    disabled={props.submitting}
                    style={{ minWidth: 'auto' }}
                    // @ts-ignore
                    onClick={(e: SyntheticEvent) => {
                      e.stopPropagation()
                      props.buySellActions.deleteCard(card.id)
                    }}
                  >
                    <FormattedMessage id='buttons.remove' defaultMessage='Remove' />
                  </RemoveButton>
                </Flex>
              </Flex>
            </Box>
          )
        })}
      </SettingSummary>
      <CustomSettingComponent>
        <Button
          nature='primary'
          data-e2e='addCardFromSettings'
          onClick={() => props.handleCreditCardClick()}
        >
          <FormattedMessage id='buttons.add_card' defaultMessage='Add Card' />
        </Button>
      </CustomSettingComponent>
    </CustomSettingContainer>
  )
}

type Props = OwnProps &
  SuccessStateType & {
    handleCreditCardClick: () => void
  }

export default reduxForm<{}, Props>({ form: FORM_BS_CHECKOUT_CONFIRM })(Success)
